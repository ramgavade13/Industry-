from django.http import HttpResponse, Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import CEO_ADMIN_MANAGER
from .docx_generators import (
    build_executive_docx,
    build_financial_docx,
    build_kpi_docx,
    build_risk_docx,
)
from .generators import (
    build_executive_pdf,
    build_financial_pdf,
    build_kpi_pdf,
    build_risk_pdf,
)

GENERATORS = {
    "pdf": {
        "executive": build_executive_pdf,
        "kpi": build_kpi_pdf,
        "financial": build_financial_pdf,
        "risk": build_risk_pdf,
    },
    "docx": {
        "executive": build_executive_docx,
        "kpi": build_kpi_docx,
        "financial": build_financial_docx,
        "risk": build_risk_docx,
    },
}

CONTENT_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class ReportDownloadView(APIView):
    """
    Report download endpoint: GET /api/reports/<type>/  (PDF by default)
    or GET /api/reports/<type>/?output=docx for a Word file.
    (The parameter is "output" because DRF reserves "format" for its own use.)

    Executive and Financial reports are secured exclusively for Executive (CEO) and Administrator roles.
    KPI and Risk reports are accessible to Managers, Executives, and Administrators.
    """
    permission_classes = [CEO_ADMIN_MANAGER]

    def get(self, request, report_type):
        output = request.query_params.get("output", "pdf").lower()
        if output not in GENERATORS:
            return Response(
                {"detail": "Unsupported output. Use pdf or docx."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        generator = GENERATORS[output].get(report_type)
        if not generator:
            raise Http404("Unknown report type")

        # Executive and Financial reports are confidential
        if report_type in ["executive", "financial"]:
            if not (request.user.role in ["ceo", "admin"] or request.user.is_superuser):
                return Response(
                    {
                        "detail": "Restricted access: Only Executive (CEO) and Administrator accounts can generate this report."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        buffer = generator()
        response = HttpResponse(buffer, content_type=CONTENT_TYPES[output])
        response["Content-Disposition"] = f'attachment; filename="{report_type}-report.{output}"'
        return response