import { Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { WelcomeComponent } from '../welcome_page/welcome.component';
import { DashboardComponent } from './dashbored/dashbored.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { DownloadPatientDocumentComponent } from './download-patient-document/download-patient-document.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientInfoComponent } from './patient-info/patient-info.component';
import { NotificationListComponent } from './notifications-list/notifications-list.component';
import { AnalyzeDocumentsComponent } from './analyze-documents/analyze-documents.component';
import { CreatNotificationsComponent } from './creat-notifications/creat-notifications.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import { EcgAnalysisComponent } from './ecg-analysis/ecg-analysis.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';

export const routes: Routes = [
  {
    path: 'app-login',
    component:LoginComponent
  },

  {
    path: '',
    redirectTo: 'app-login',
    pathMatch: 'full',
  },
  {
    path: 'app-navbar',
    component: NavbarComponent,
  },
  {
    path: 'app-welcome',
    component: WelcomeComponent,
  },
  {
    path: 'app-dashbored',
    component: DashboardComponent,
  },
  {
    path: 'app-upload-document',
    component: UploadDocumentComponent,
  },
  {
    path: 'app-download-patient-document',
    component: DownloadPatientDocumentComponent,
  },

  {
    path: 'app-manage-account',
    component: ManageAccountComponent,
  },
  {
    path: 'app-reset-password/:token',
    component: ResetPasswordComponent,
  },
  {
    path: 'app-forget-password', // ✅ Fixed extra space
    component: ForgetPasswordComponent,
  },
  {
    path:'app-patient-list',
    component: PatientListComponent
  },
  {
    path: 'app-patient-info',
    component: PatientInfoComponent
  },

  {
    path:'app-notifications-list',
    component: NotificationListComponent
  },
  {
    path: 'app-analyze-documents',
    component: AnalyzeDocumentsComponent
  },

  {
    path:'app-creat-notifications'  ,
    component: CreatNotificationsComponent
  },
{
  path: 'app-permissions',
  component: PermissionsComponent
},
{
  path:'app-sidebar',
  component: SidebarComponent
},
{
  path:"app-header",
  component:HeaderComponent
},
{
  path:'app-create-patient',
  component:CreatePatientComponent
},
  {
    path: 'app-ecg-analysis',
    component: EcgAnalysisComponent
  },
  {
    path: 'app-patient-history',
    component: PatientHistoryComponent
  },
  {
    path: 'app-admin-profile',
    component : AdminProfileComponent
  }

];
