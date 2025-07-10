import api from '../app/lib/axios';

const fetchData = async () => {
  const response = await api.get('/user/');
  console.log(response.data);
};


export default function Home() {
  return (
    <div>
      <h1 className="p-30 bg-amber-200 text-center font-bold text-4xl">Power Share</h1>
    </div>
  )
}
