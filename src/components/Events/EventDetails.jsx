import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const eventId = useParams().id;
  const navigate = useNavigate();

  const { isPending, isError, error, data } = useQuery({
    queryKey: ['events', eventId],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId }),
  });

  const { mutate, isPending: isPendingDeletition } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleDelete() {
    mutate({ id: eventId });
  }

  function handleStartDeleting() {
    setIsDeleting(true);
  }

  function handleStopDeleting() {
    setIsDeleting(false);
  }


  if (isPending) {
    return (
      <div id='event-details-content' className='center'>
        <LoadingIndicator />
      </div>
    )
  }

  if (isError) {
    return (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || 'Failed to fetch event'}
        />
      </div>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting} isPending={isDeleting}>
          <p>Are you sure you want to delete this event?</p>
          <div className="form-actions">
            <button className='button' onClick={handleStopDeleting}> Cancel </button>
            <button className='button' onClick={handleDelete} disabled={isPendingDeletition}>
              {isPendingDeletition ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      <Outlet />

      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button
              className="button"
              onClick={handleStartDeleting}
              disabled={isPendingDeletition}
            >
              {isPendingDeletition ? 'Deleting...' : 'Delete'}
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
