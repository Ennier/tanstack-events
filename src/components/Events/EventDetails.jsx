import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';

export default function EventDetails() {
  const eventId = useParams().id;
  const navigate = useNavigate();

  const { mutate: deleteEventMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      console.log('event deleted');
      queryClient.removeQueries(['event', eventId]);
      console.log('query removed');
      navigate('/events');
      console.log('navigate to events');
    },
    onError: (error) => {
      console.log(error);
    },
  });
  
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['event', eventId],
    queryFn: ({ signal }) => fetchEvent({ id: eventId, signal }),
  });


  function handleDelete() {
    deleteEventMutation({ id: eventId });
    console.log('Delete mutation triggered');
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isError && <p>{error.info?.message}</p>}
      {isLoading && <p>Loading...</p>}
      {isDeleting && <p>Deleting...</p>}
      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`${data.date}${data.time}`}>{data.date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>}
    </>
  );
}
