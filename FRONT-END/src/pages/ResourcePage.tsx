import { useParams } from "react-router-dom";

const ResourcePage = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Recurso: {id}</h1>
      <p className="mt-4 text-gray-700">
        Aquí se mostrará toda la información del recurso, historial,
        métricas, alertas y acciones.
      </p>
    </div>
  );
};

export default ResourcePage;
