export const fetcher = async (url: string) => {
  const res = await fetch(`http://localhost:8000${url}`);
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
};



