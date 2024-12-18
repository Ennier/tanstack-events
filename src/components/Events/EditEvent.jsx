import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const eventId = useParams().id;

  // Query for fetching the event
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', eventId],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId }),
  });

  // Mutation for updating the event
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ event }) => {
      // Cancel any outgoing queries for the event
      await queryClient.cancelQueries(['events', eventId]);
      const previousEvent = queryClient.getQueryData(['events', eventId]);

      // Optimistically update the cache
      queryClient.setQueryData(['events', eventId], event);

      return { previousEvent };
    },
    onError: (error, data, context) => {
      // Rollback on error
      queryClient.setQueryData(['events', eventId], context.previousEvent);
    },
    onSettled: () => {
      // Invalidate the query to refetch the event
      queryClient.invalidateQueries(['events', eventId]);
    },
  });

  // Submit handler
  function handleSubmit(formData) {
    mutate({id: eventId, event: formData});
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  // Render content based on the state
  let content = null;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || 'Failed to fetch event'}
        />
      </div>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}> {content} </Modal>
  );
}
