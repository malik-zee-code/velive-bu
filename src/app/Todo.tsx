"use client";
import { useQuery, gql } from '@apollo/client';

const GET_PROPERTIES = gql`
query GetProperties {
  properties {
    price
		location
		title
		created_at
		updated_at
		id
  }
}
`;

const Todos = () => {
  const { data, loading, error } = useQuery(GET_PROPERTIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <ul>
      {data.properties.map((property: any) => (
        <li key={property.id}>{property.title} - {property.price}</li>
      ))}
    </ul>   
  );
};


export default Todos;