from django.http import HttpResponse, Http404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .generators import (
    build_executive_pdf,
    build_financial_pdf,
    build_kpi_pdf,
    build_risk_pdf,
)

GENERATORS = {
    "executive": build_executive_pdf,
    "kpi": build_kpi_pdf,
    "financial": build_financial_pdf,
    "risk": build_risk_pdf,
}


class ReportDownloadView(APIView):
    """
    Report download endpoint.
    Executive and Financial reports are secured exclusively for Executive (CEO) and Administrator roles.
    KPI and Risk reports are accessible to Managers, Executives, and Administrators.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, report_type):
        generator = GENERATORS.get(report_type)
        if not generator:
            raise Http404("Unknown report type")

        # Enforce role-based access control per report confidentiality
        if report_type in ["executive", "financial"]:
            if not (request.user.role in ["ceo", "admin"] or request.user.is_superuser):
                return Response(
                    {
                        "detail": "Restricted access: Only Executive (CEO) and Administrator accounts can generate this report."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            if not (request.user.role in ["ceo", "admin", "manager"] or request.user.is_superuser):
                return Response(
                    {"detail": "Management access required: Report available to Managers, Executives, and Administrators."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        buffer = generator()
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{report_type}-report.pdf"'
        return response