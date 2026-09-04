export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-900 sm:text-5xl md:text-6xl">
            Sterling Gates
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-emerald-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Welcome to Sterling Gates Consultancy & Realty
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="/api/health"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
              >
                Check API Health
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Available API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Health Check</h3>
              <p className="text-sm text-gray-600 mt-2">GET /api/health</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Auth</h3>
              <p className="text-sm text-gray-600 mt-2">POST /api/auth/login, GET /api/auth/me</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Advisors</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/advisors, GET/PATCH/DELETE /api/advisors/[id]</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Properties</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/properties, GET /api/properties/admin, etc.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Blogs</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/blogs, GET /api/blogs/admin, etc.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Enquiries</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/enquiries, PATCH /api/enquiries/[id]</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Curations</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/curations, GET /api/curations/admin, etc.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Newsletter</h3>
              <p className="text-sm text-gray-600 mt-2">GET/POST /api/newsletter, DELETE /api/newsletter/[id]</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Settings</h3>
              <p className="text-sm text-gray-600 mt-2">GET/PUT /api/settings, GET /api/settings/public</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-emerald-800">Uploads</h3>
              <p className="text-sm text-gray-600 mt-2">POST /api/uploads</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
