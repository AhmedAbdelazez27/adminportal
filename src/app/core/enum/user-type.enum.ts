export enum Gender {
  male = 1,
  female = 2,
};
export enum UserStatus {
  New = 1,
  Active = 2,
  Suspended = 3,
  Rejected = 4,
};

export enum UserType {
  Admin = 1,
  Foundation = 2,
  Instituation = 3,
}


export enum ServiceDataType {
  ServiceConfirmation = 1,
  ServiceInquery = 2,
  FastingServiceInquery = 3,
}

export enum isDisabledType {
  isDisabledTypeTrue = "Y",
  isDisabledTypeFalse = "N",
}
export enum ServiceStatus {
  Accept = 1,
  Reject = 2,
  RejectForReason = 3,
  Wait = 4,
  Received = 5,
  ReturnForModifications = 7
}

export enum GlAccountSelectionType {
  Entity = 1,
  Country = 2,
  Branch = 3,
  Department = 4,
  Account = 5,
}

export enum ServicesType {
  TentPermission = 1,
  CharityEventPermit = 2,
  RequestForStaffAppointment = 3,
  ReligiousInstitutionRequest = 4,
  RequestAnEventAnnouncement = 5,
  DonationCampaignPermitRequest = 6,
  GrievanceRequest = 7,
  DistributionSitePermitApplication = 1001,
  RequestComplaint = 1002
}


export enum serviceIdEnum {
  serviceId1 = "1",
  serviceId2 = "2",
  serviceId3 = "3",
  serviceId4 = "4",
  serviceId5 = "5", // Advertisement
  serviceId6 = "6",
  serviceId7 = "7",
  serviceId1001 = "1001",
  serviceId1002 = "1002",
}


export class accountStatus {
  static readonly accountStatusList = [
    { id: 1, text: 'جديد', textEn: 'New' },
    { id: 2, text: 'تم المعالجة', textEn: 'Mapped' },
    { id: 3, text: 'موجود', textEn: 'Existing' },
  ];
}
