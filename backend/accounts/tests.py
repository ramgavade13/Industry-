from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from finance.models import KPI, RevenueMonth
from forecasting.models import Forecast
from recommendations.models import Recommendation

User = get_user_model()


class JWTAuthAndRBACTests(APITestCase):
    def setUp(self):
        # Create users for all roles
        self.ceo = User.objects.create_user(
            username="ceo_user",
            email="ceo@test.com",
            password="Password123!",
            role="ceo",
            first_name="CEO Rohan",
        )
        self.admin = User.objects.create_user(
            username="admin_user",
            email="admin@test.com",
            password="Password123!",
            role="admin",
            first_name="Admin Alex",
            is_staff=True,
        )
        self.manager = User.objects.create_user(
            username="manager_user",
            email="manager@test.com",
            password="Password123!",
            role="manager",
            first_name="Manager Priya",
        )
        self.employee = User.objects.create_user(
            username="employee_user",
            email="employee@test.com",
            password="Password123!",
            role="employee",
            first_name="Employee Amit",
        )

        # Seed sample data for endpoints
        KPI.objects.create(label="Revenue", value="₹40L", change="+5%", trend="up")
        RevenueMonth.objects.create(month="Oct", revenue=40.0, expenses=25.0)
        Forecast.objects.create(month="Nov", actual=None, forecast=45.0)
        Recommendation.objects.create(
            title="Optimise churn",
            problem="Churn slightly up",
            evidence="Support tickets",
            action="Follow up",
            impact="High",
            confidence="High",
        )

    def get_jwt_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def auth_client(self, user):
        token = self.get_jwt_token(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return token

    # =========================================================================
    # 1. JWT Authentication Tests
    # =========================================================================

    def test_login_with_email_success(self):
        """User can log in with email and receive JWT tokens with claims."""
        url = reverse("login")
        response = self.client.post(url, {"email": "ceo@test.com", "password": "Password123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["role"], "ceo")

        # Verify decoded JWT payload contains role and custom claims
        access_token = AccessToken(response.data["access"])
        self.assertEqual(access_token["role"], "ceo")
        self.assertEqual(access_token["email"], "ceo@test.com")
        self.assertEqual(access_token["user_id"], self.ceo.id)

    def test_login_with_username_success(self):
        """User can also log in with username."""
        url = reverse("login")
        response = self.client.post(url, {"username": "admin_user", "password": "Password123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "admin")

    def test_login_invalid_credentials_fails(self):
        """Login with wrong password fails with 401."""
        url = reverse("login")
        response = self.client.post(url, {"email": "ceo@test.com", "password": "WrongPassword"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_signup_prevents_role_escalation(self):
        """Public signup must ignore requested role and default to 'employee'."""
        url = reverse("signup")
        payload = {
            "email": "hacker@test.com",
            "password": "Password123!",
            "role": "ceo",  # Attempt to escalate privilege to CEO
            "first_name": "Attacker",
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_user = User.objects.get(email="hacker@test.com")
        self.assertEqual(created_user.role, "employee")
        self.assertNotEqual(created_user.role, "ceo")

    def test_current_user_profile_with_jwt(self):
        """Bearer token allows access to /api/accounts/me/."""
        self.auth_client(self.ceo)
        url = reverse("current_user")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "ceo")
        self.assertTrue(response.data["is_executive"])

    def test_logout_blacklists_refresh_token(self):
        """Logout endpoint blacklists the refresh token so it cannot be refreshed."""
        refresh = RefreshToken.for_user(self.employee)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")

        logout_url = reverse("logout")
        response = self.client.post(logout_url, {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempting to refresh the blacklisted token should fail
        refresh_url = reverse("token_refresh")
        refresh_response = self.client.post(refresh_url, {"refresh": str(refresh)})
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================================================================
    # 2. Administrator Access Tests
    # =========================================================================

    def test_admin_can_list_users(self):
        """Only administrators can access user management list."""
        url = reverse("admin_users_list")

        # Admin access: allowed
        self.auth_client(self.admin)
        admin_res = self.client.get(url)
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(admin_res.data), 4)

        # Non-admin access (CEO, Manager, Employee): forbidden
        for non_admin in [self.ceo, self.manager, self.employee]:
            self.auth_client(non_admin)
            res = self.client.get(url)
            self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_user_role(self):
        """Administrators can promote or reassign user roles."""
        url = reverse("admin_user_role_update", kwargs={"pk": self.employee.id})

        # Non-admin cannot promote
        self.auth_client(self.manager)
        forbidden_res = self.client.patch(url, {"role": "manager"})
        self.assertEqual(forbidden_res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can promote employee to manager
        self.auth_client(self.admin)
        promote_res = self.client.patch(url, {"role": "manager"})
        self.assertEqual(promote_res.status_code, status.HTTP_200_OK)

        self.employee.refresh_from_db()
        self.assertEqual(self.employee.role, "manager")

    # =========================================================================
    # 3. Executive (CEO) and Administrator Access to Confidential Endpoints
    # =========================================================================

    def test_confidential_financials_access(self):
        """Confidential revenue trend is restricted strictly to CEO and Admin."""
        url = reverse("revenue-trend")

        # Unauthenticated: 401
        self.client.credentials()
        self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)

        # CEO: 200 OK
        self.auth_client(self.ceo)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        # Admin: 200 OK
        self.auth_client(self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        # Manager: 403 Forbidden
        self.auth_client(self.manager)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

        # Employee: 403 Forbidden
        self.auth_client(self.employee)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

    def test_forecasting_access(self):
        """Forecasting endpoints are restricted strictly to CEO and Admin."""
        forecast_url = reverse("forecast-revenue")
        summary_url = reverse("forecast-summary")

        for endpoint in [forecast_url, summary_url]:
            # CEO: 200 OK
            self.auth_client(self.ceo)
            self.assertEqual(self.client.get(endpoint).status_code, status.HTTP_200_OK)

            # Admin: 200 OK
            self.auth_client(self.admin)
            self.assertEqual(self.client.get(endpoint).status_code, status.HTTP_200_OK)

            # Manager: 403 Forbidden
            self.auth_client(self.manager)
            self.assertEqual(self.client.get(endpoint).status_code, status.HTTP_403_FORBIDDEN)

            # Employee: 403 Forbidden
            self.auth_client(self.employee)
            self.assertEqual(self.client.get(endpoint).status_code, status.HTTP_403_FORBIDDEN)

    def test_ai_recommendations_access(self):
        """AI Recommendations are restricted strictly to CEO and Admin."""
        url = reverse("recommendations-list")

        self.auth_client(self.ceo)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.auth_client(self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.auth_client(self.manager)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

        self.auth_client(self.employee)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

    def test_executive_report_download_access(self):
        """Executive report download is restricted to CEO and Admin."""
        url = reverse("report-download", kwargs={"report_type": "executive"})

        # CEO and Admin can download
        self.auth_client(self.ceo)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.auth_client(self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        # Manager and Employee are forbidden from executive reports
        self.auth_client(self.manager)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

        self.auth_client(self.employee)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

    def test_management_kpi_report_download_access(self):
        """KPI report is accessible to Manager, CEO, and Admin, but not Employee."""
        url = reverse("report-download", kwargs={"report_type": "kpi"})

        self.auth_client(self.ceo)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.auth_client(self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        self.auth_client(self.manager)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

        # Employee: Forbidden
        self.auth_client(self.employee)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)
