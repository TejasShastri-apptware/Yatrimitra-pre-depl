import { useParams, useNavigate } from "react-router";
import PostDashboard from "./PostDashboard";

const PostDashboardWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const savedDiagrams = JSON.parse(localStorage.getItem("diagrams") || "[]");
  const diagram = savedDiagrams.find((d: any) => d.id === id);

  if (!diagram) {
    return <div>Diagram not found</div>;
  }

  return (
    <PostDashboard
      diagram={diagram}
      onEdit={() => navigate(`/editor/${id}`)}
    />
  );
};

export default PostDashboardWrapper;