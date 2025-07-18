import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { vendorService } from '../../../../core/services/vendor.service';
import { vendorList,VendorIDList,VendorStatusList,vendorFilter,Entity,selectedvendor } from './Models/vendor.models';
@Component({
  selector: 'app-vendor',
  imports: [CommonModule,FormsModule],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss'
})
export class VendorComponent implements OnInit {
  vendorList: vendorList[] = [];
    entityList: Entity[] = [];
    VendorIDList: VendorIDList[] = [];
    VendorStatusList: VendorStatusList[] = [];
       
        selectedvendor: selectedvendor ={} as selectedvendor;




  FilterVendorModel: vendorFilter = { 
      entityId: '',
      VendorName: null,
      Status: '',      
        
    OrderbyValue: 'VENDOR_NUMBER'

  };

  constructor(private apiService: vendorService) {}

  ngOnInit(): void {
    this.GetVendor(); 
  }

  GetVendor(): void {    
    const filter: vendorFilter = { ...this.FilterVendorModel };        
  this.apiService.Getvendor(this.FilterVendorModel).subscribe({
    next: (response:vendorList[]) => {
      this.vendorList = (response || []).map((item: any) => {
        return item;
      });
    },
    error: (err) => {
      console.error('API error:', err);
    }
  });
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
loadVendorName(entityId: any): void {
        const params = {  take: 200,
  skip: 0, entityId };  
 
  if (this.VendorIDList.length === 0) {
    this.apiService.getVendor_ID(params).subscribe({
      next: (response: any) => {
        this.VendorIDList = response?.results || [];  
        console.log("vendor",this.VendorIDList); 
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}

loadStatus(): void {
  if (this.VendorStatusList.length === 0) {
    this.apiService.getApVendorStatus().subscribe({
      next: (response: any) => {
        console.log("Status",response);
        this.VendorStatusList = response?.results || []; 
        console.log("vendorst",this.VendorStatusList)
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  }
}

GetVendorDataforscreen(VendorId:any,entityId: any): void {
      const params = { VendorId, entityId };  
    this.apiService.GetVendorDataforscreen(params).subscribe({
      next: (response: any) => {
        this.selectedvendor = response || [];  
        console.log("vendor",this.VendorIDList); 
      },
      error: (err) => {
        console.error('Entity load error', err);
      }
    });
  
}

  cleargljeFilter(): void {
    this.FilterVendorModel = {
      entityId: '',
      VendorName: '',
      Status: '',
    };
    this.GetVendor();
  }

  onLinkClick(event: Event, entityId: any): void {
  event.preventDefault(); // prevent default anchor behavior
  this.loadVendorName(entityId);
  }
  
}
