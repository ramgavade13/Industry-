from django.http import HttpResponse, Http404
from rest_framework.views import APIView
from .generators import (
    build_executive_pdf, build_kpi_pdf,
    build_financial_pdf, build_risk_pdf,
)

GENERATORS = {
    "executive": build_executive_pdf,
    "kpi": build_kpi_pdf,
    "financial": build_financial_pdf,
    "risk": build_risk_pdf,
}


class ReportDownloadView(APIView):
    def get(self, request, report_type):
        generator = GENERATORS.get(report_type)
        if not generator:
            raise Http404("Unknown report type")

        buffer = generator()
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{report_type}-report.pdf"'
        return response