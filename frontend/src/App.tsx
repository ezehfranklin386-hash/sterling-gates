// Route definitions (docs/frontend-spec.md §4): public shell + protected admin.

import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './lib/PublicLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';

import { Home } from './pages/public/Home';
import { Properties } from './pages/public/Properties';
import { PropertyDetail } from './pages/public/PropertyDetail';
import { Insights } from './pages/public/Insights';
import { ArticleDetail } from './pages/public/ArticleDetail';
import { Contact } from './pages/public/Contact';
import { Neighbourhoods, NeighbourhoodDetail } from './pages/public/Neighbourhoods';
import { Curations, CurationDetail } from './pages/public/Curations';
import { Advisors } from './pages/public/Advisors';

import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { BlogsAdmin } from './pages/admin/BlogsAdmin';
import { BlogEditor } from './pages/admin/BlogEditor';
import { PropertiesAdmin } from './pages/admin/PropertiesAdmin';
import { PropertyEditor } from './pages/admin/PropertyEditor';
import { EnquiriesAdmin } from './pages/admin/EnquiriesAdmin';
import { NewsletterAdmin } from './pages/admin/NewsletterAdmin';
import { CurationsAdmin } from './pages/admin/CurationsAdmin';
import { AdvisorsAdmin } from './pages/admin/AdvisorsAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:slug" element={<PropertyDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="insights/:slug" element={<ArticleDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="neighbourhoods" element={<Neighbourhoods />} />
        <Route path="neighbourhoods/:slug" element={<NeighbourhoodDetail />} />
        <Route path="curations" element={<Curations />} />
        <Route path="curations/:slug" element={<CurationDetail />} />
        <Route path="advisors" element={<Advisors />} />
      </Route>

      {/* Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin, protected */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<BlogsAdmin />} />
          <Route path="blogs/new" element={<BlogEditor />} />
          <Route path="blogs/:id" element={<BlogEditor />} />
          <Route path="properties" element={<PropertiesAdmin />} />
          <Route path="properties/new" element={<PropertyEditor />} />
          <Route path="properties/:id" element={<PropertyEditor />} />
          <Route path="enquiries" element={<EnquiriesAdmin />} />
          <Route path="newsletter" element={<NewsletterAdmin />} />
          <Route path="curations" element={<CurationsAdmin />} />
          <Route path="advisors" element={<AdvisorsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}