export function CustomersSection() {
  const logos = [
    { name: "Company A", color: "text-blue-600" },
    { name: "Company B", color: "text-red-600" },
    { name: "Company C", color: "text-orange-600" },
    { name: "Company D", color: "text-gray-700" },
    { name: "Company E", color: "text-yellow-600" },
  ]

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="text-center text-lg font-semibold text-gray-900 mb-10">
          268,000 customers in over 135 countries grow their businesses with our platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className={`text-4xl font-bold ${logo.color} opacity-70 hover:opacity-100 transition-opacity`}
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
