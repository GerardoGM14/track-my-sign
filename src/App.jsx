export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              Tailwind está funcionando 🚀
            </span>
          </h1>
          <p className="mt-4 text-gray-600">
            Si ves colores, sombras y efectos hover, ¡todo OK!
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="rounded-xl px-5 py-2.5 bg-indigo-600 text-white font-medium shadow hover:shadow-md hover:bg-indigo-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Botón primario
            </button>
            <button className="rounded-xl px-5 py-2.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm">
              Secundario
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {/* Tarjeta simple */}
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Tarjeta de prueba</h2>
          <p className="mt-2 text-gray-600">
            Esta tarjeta tiene borde, sombra y padding aplicados con clases de Tailwind.
          </p>
          <label className="mt-4 block">
            <span className="text-sm text-gray-700">Input de ejemplo</span>
            <input
              className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Escribe algo…"
            />
          </label>
        </div>

        {/* Grid responsive */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {["Uno", "Dos", "Tres"].map((t, i) => (
            <article
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <span className="font-semibold text-gray-700">{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">Card {t}</h3>
              <p className="mt-2 text-gray-600">
                Pasa el mouse por aquí y debería elevarse (hover + shadow + translate).
              </p>
              <a
                href="#"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
              >
                Ver más →
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
