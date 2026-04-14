import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { AppLayout } from './components/AppLayout'
import { LegacyAppRedirect } from './components/LegacyAppRedirect'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { VoterRegisterPage } from './pages/VoterRegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { ProfilePage } from './pages/ProfilePage'
import { VoterManagementPage } from './roles/voter/VoterManagementPage'
import { CandidateManagementPage } from './roles/candidate/CandidateManagementPage'
import { MisOfficeManagementPage } from './roles/mis-office/MisOfficeManagementPage'
import { OsaOfficeManagementPage } from './roles/osa-office/OsaOfficeManagementPage'
import { PositionsManagementPage } from './roles/admin/PositionsManagementPage'
import { ElectionsManagementPage } from './roles/admin/ElectionsManagementPage'
import { ElectionResultsPage } from './roles/admin/ElectionResultsPage'
import { ElectionResultDetailPage } from './roles/admin/ElectionResultDetailPage'
import { CampaignApplicationsReviewPage } from './roles/admin/CampaignApplicationsReviewPage'
import { CandidateCampaignApplicationPage } from './roles/candidate/CandidateCampaignApplicationPage'
import { VoterVotePage } from './roles/voter/VoterVotePage'

function AdminShell() {
  return (
    <ProtectedRoute roles="admin">
      <AppLayout />
    </ProtectedRoute>
  )
}

function VoterShell() {
  return (
    <ProtectedRoute roles="voter">
      <AppLayout />
    </ProtectedRoute>
  )
}

function CandidateShell() {
  return (
    <ProtectedRoute roles="candidate">
      <AppLayout />
    </ProtectedRoute>
  )
}

function MisOfficeShell() {
  return (
    <ProtectedRoute roles="mis_office">
      <AppLayout />
    </ProtectedRoute>
  )
}

function OsaOfficeShell() {
  return (
    <ProtectedRoute roles="osa_office">
      <AppLayout />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<VoterRegisterPage />} />

          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="voters" element={<VoterManagementPage />} />
            <Route path="candidates" element={<CandidateManagementPage />} />
            <Route path="mis-office" element={<MisOfficeManagementPage />} />
            <Route path="osa-office" element={<OsaOfficeManagementPage />} />
            <Route path="positions" element={<PositionsManagementPage />} />
            <Route path="elections" element={<ElectionsManagementPage />} />
            <Route path="election-results" element={<ElectionResultsPage />} />
            <Route
              path="election-results/:electionId"
              element={<ElectionResultDetailPage />}
            />
            <Route
              path="campaign-applications"
              element={<CampaignApplicationsReviewPage />}
            />
          </Route>

          <Route path="/voter" element={<VoterShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="vote/:electionId" element={<VoterVotePage />} />
          </Route>

          <Route path="/candidate" element={<CandidateShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="campaign/application"
              element={<CandidateCampaignApplicationPage />}
            />
          </Route>

          <Route path="/mis-office" element={<MisOfficeShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="elections"
              element={<ElectionsManagementPage pathRole="mis_office" />}
            />
            <Route
              path="election-results"
              element={<ElectionResultsPage pathRole="mis_office" />}
            />
            <Route
              path="election-results/:electionId"
              element={<ElectionResultDetailPage pathRole="mis_office" />}
            />
          </Route>

          <Route path="/osa-office" element={<OsaOfficeShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="elections"
              element={<ElectionsManagementPage pathRole="osa_office" />}
            />
            <Route
              path="election-results"
              element={<ElectionResultsPage pathRole="osa_office" />}
            />
            <Route
              path="election-results/:electionId"
              element={<ElectionResultDetailPage pathRole="osa_office" />}
            />
          </Route>

          <Route path="/app/*" element={<LegacyAppRedirect />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
