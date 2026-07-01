'use client';

interface AyudaStatsProps {
  pendiente: number;
  aprobada: number;
  rechazada: number;
  todos: number;
}

export function AyudaStats({ pendiente, aprobada, rechazada, todos }: AyudaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendiente}</p>
          </div>
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 font-bold text-lg">!</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Aprobadas</p>
            <p className="text-2xl font-bold text-green-600">{aprobada}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold text-lg">✓</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Rechazadas</p>
            <p className="text-2xl font-bold text-red-600">{rechazada}</p>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">✗</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{todos}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">#</span>
          </div>
        </div>
      </div>
    </div>
  );
}
