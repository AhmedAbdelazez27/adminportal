import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gljeService } from '../../../../core/services/gl-je.service';
import { GljeFilter, GljeList, Entity,Je_SoureList,Je_StateList,Je_CurrList,GlJe_trList,gljeHeaderData} from './Models/gl-je.models';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-gl-je',
  imports: [CommonModule,FormsModule],
  templateUrl: './gl-je.component.html',
  styleUrl: './gl-je.component.scss'
})
export class GLJEComponent implements OnInit {
gljeHeaderData: gljeHeaderData = {} as gljeHeaderData;
  GljeList: GljeList[] = [];
    entityList: Entity[] = [];
    Je_SoureList: Je_SoureList[] = [];
    Je_StateList: Je_StateList[] = [];
        Je_CurrList: Je_CurrList[] = [];
        GlJe_trList: GlJe_trList[] = [];




  filtergljeModel: GljeFilter = { 
      entityId: '',
      Att10: '',
      JE_NAME: '',
      Att7: '',
      Je_Soure: '',
      Amount:null,
      Je_State: '',
      Je_Curr: '',
      Je_Date: '',    
    OrderbyValue: 'ENTITY_ID'

  };

  constructor(private apiService: gljeService) {}

  ngOnInit(): void {
    this.Getglje(); // Initial data load
  }

  Getglje(): void {
  this.apiService.GetGlJeHeader(this.filtergljeModel).subscribe({
    next: (response:GljeList[]) => {
            this.GljeList = (response || []).map((item: any) => {
        if (item.Je_Date) {
            const date = new Date(item.hD_DATE);
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            item.Je_Date = `${day}-${month}-${year}`;
          }
        return item;
      });
    },
    error: (err) => {
      console.error('API error:', err);
    }
  });
  }

Getglje_tr(jE_ID: string, entitY_ID: string): void {
   const params = { receiptId:jE_ID, entityId: entitY_ID };
      forkJoin({
        trList: this.apiService.GetGlJe_tr(params),
        header: this.apiService.GetGeneralJournalHeaderDetails(params)
      }).subscribe({
        next: (result: { trList: GlJe_trList[]; header: gljeHeaderData[] | gljeHeaderData }) => {
          this.GlJe_trList = result.trList || [];
          this.gljeHeaderData = Array.isArray(result.header)
            ? result.header[0] || ({} as gljeHeaderData)
            : result.header;
        },
        error: (err) => {
          console.error('Error fetching invoice details:', err);
        }
      });
}

  applygljeFilter(): void {
if (this.filtergljeModel.Je_Date && this.filtergljeModel.Je_Date.trim() !== '') {
  const date = new Date(this.filtergljeModel.Je_Date);
  if (!isNaN(date.getTime())) {
    this.filtergljeModel.Je_Date = date.toISOString(); // ✅ Valid ISO format
  } else {
    delete this.filtergljeModel.Je_Date; // ❌ invalid, remove it
  }
} else {
  delete this.filtergljeModel.Je_Date; 
}

    if (
      this.filtergljeModel.Amount === null ||
      isNaN(Number(this.filtergljeModel.Amount))
    ) {
      this.filtergljeModel.Amount = null;
    }

    this.Getglje();
  }
  loadEntities(): void {
  if (this.entityList.length === 0) {
    this.apiService.getEntities().subscribe({
      next: (response: any) => {
        this.entityList = response?.data || []; 
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}
loadJe_Soure(): void {
  if (this.Je_SoureList.length === 0) {
    this.apiService.getJe_Soure().subscribe({
      next: (response: any) => {
        this.Je_SoureList = response?.results || []; 
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}
loadJe_State(): void {
  if (this.Je_StateList.length === 0) {
    this.apiService.getJe_State().subscribe({
      next: (response: any) => {
        this.Je_StateList = response?.results || []; 
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}
loadJe_Curr(): void {
  if (this.Je_CurrList.length === 0) {
    this.apiService.getJe_Curr().subscribe({
      next: (response: any) => {
        this.Je_CurrList = response?.results || []; // ⬅️ Accessing the array under "data"
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}
  cleargljeFilter(): void {
    this.filtergljeModel = {
     entityId: '',
      Att10: '',
      JE_NAME: '',
      Att7:'',
      Amount: null,
      Je_Soure:'',
      Je_State:'',
      Je_Curr:'',
      Je_Date: ''
    };
    this.Getglje();
  }


}
