from dataclasses import dataclass
from typing import Literal

JobStatus = Literal["queued", "processing", "succeeded", "failed"]


@dataclass
class VirtualTryOnInput:
    person_image_bytes: bytes
    product_image_url: str
    product_id: str
    category: str
    color: str | None = None
    size: str | None = None


@dataclass
class VirtualTryOnResult:
    job_id: str
    status: JobStatus
    result_image_url: str | None = None
    error: str | None = None
