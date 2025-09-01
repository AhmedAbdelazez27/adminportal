import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AttachmentDto } from '../../app/core/dtos/attachments/attachment.dto';

@Component({
  selector: 'app-attachment-gallery',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './attachment-gallery.component.html',
})
export class AttachmentGalleryComponent {
  @Input() attachments: AttachmentDto[] = [];

  previewImg: string | null = null;
  previewTitle: string = '';

  onDownload(imgPath: string | null | undefined, type: string) {
    if (!imgPath) return;
    const link = document.createElement('a');
    link.href = imgPath;
    link.target = '_blank';
    link.download = type || '';
    link.click();
  }

  openPreview(item: AttachmentDto) {
    if (!item.imgPath) return;
    this.previewImg = item.imgPath;
    this.previewTitle = item.attachmentTitle || '';
  }

  closePreview() {
    this.previewImg = null;
    this.previewTitle = '';
  }
}
