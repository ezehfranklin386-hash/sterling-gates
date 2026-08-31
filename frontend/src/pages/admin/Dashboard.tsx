// Dashboard: 3 KPI tiles (blogs, properties, enquiries) + subscriber count.

import { getAccessToken } from '../../lib/session';
import { useAdminBlogs } from '../../hooks/useBlogs';
import { useAdminProperties } from '../../hooks/useProperties';
import { useEnquiries } from '../../hooks/useEnquiries';
import { useNewsletterSubscribers } from '../../hooks/useNewsletter';
import { StatTile } from '../../components/admin/AdminUI';

export function Dashboard() {
  const token = getAccessToken();
  const blogs = useAdminBlogs(token);
  const props = useAdminProperties(token);
  const enquiries = useEnquiries(token);
  const subs = useNewsletterSubscribers(token);

  return (
    <div>
      <h1 className="display text-2xl text-parchment md:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-parchment/60">Overview of your platform.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Blogs" value={blogs.data?.length} to="/admin/blogs" />
        <StatTile label="Properties" value={props.data?.length} to="/admin/properties" />
        <StatTile label="Enquiries" value={enquiries.data?.length} to="/admin/enquiries" />
        <StatTile label="Subscribers" value={subs.data?.length} to="/admin/newsletter" />
      </div>
    </div>
  );
}