import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentDto } from '../../app/core/dtos/mainApplyService/mainApplyService.dto';

@Component({
  selector: 'app-attachment-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-gallery.component.html',
})
export class AttachmentGalleryComponent {
  @Input() attachments: AttachmentDto[] = [];

  onDownload(imgPath: string | null, type: string) {
    if (!imgPath) return;
    const link = document.createElement('a');
    link.href = imgPath;
    link.target = '_blank';
    link.download = '';
    link.click();
  }


}
