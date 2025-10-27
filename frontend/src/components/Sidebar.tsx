const projects = ["Project A", "Project B", "Project C"];

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="font-bold mb-2">Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p} className="p-2 hover:bg-gray-200 cursor-pointer">{p}</li>
        ))}
      </ul>
    </div>
  );
}
