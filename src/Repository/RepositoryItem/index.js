import React from 'react';
import gql from 'graphql-tag';
import Link from '../../Link';
import { Mutation } from 'react-apollo';
import Button from '../../Button';
import REPOSITORY_FRAGMENT from '../fragments';
import '../style.css';

const STAT_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`

const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`

const WATCH_REPOSITORY = gql`
  mutation ($id: ID!, $viewerSubscription: SubscriptionState!) {
    updateSubscription(
      input: { state: $viewerSubscription, subscribableId: $id }
    ) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewerSubscription =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const updateWatch = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription },
      },
    },
  },
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  let { totalCount } = repository.watchers;
  totalCount =
    viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED
      ? totalCount + 1
      : totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount,
      },
    },
  });
};



const updateStar = (actionType) => (
  client,
    { data: { [actionType]: { starrable: { id } } } },) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  })
  let totalCount = repository.stargazers.totalCount 
  if (actionType === 'addStar') {
    totalCount = totalCount + 1;
  } 

  if (actionType === 'removeStar') {
    totalCount = totalCount - 1;
  }
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });

};

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => (
  <div>
    <div className="RepositoryItem-title">
      <h2>
        <Link href={url}>{name}</Link>
      </h2>
      <div>
          {!viewerHasStarred ? (
        <Mutation 
          mutation={STAT_REPOSITORY} 
          variables={{id}}
          update={updateStar('addStar')}>
          {(addStar, { data, loading, error }) => (
            <Button
              className={'RepositoryItem-title-action'}
              onClick={addStar}
            >
              {stargazers.totalCount} 
            Star 
            </Button>)}
      </Mutation>
          ) : (
            <Mutation 
            mutation={UNSTAR_REPOSITORY} 
            variables={{id}}
            update={updateStar('removeStar')}>
            {(removeStar, { data, loading, error }) => (
              <Button
                className={'RepositoryItem-title-action'}
                onClick={removeStar}
              >
                {stargazers.totalCount} 
              Unstar 
              </Button>)}
        </Mutation>
          )
          }
          <Mutation
            mutation={WATCH_REPOSITORY}
            variables={{
              id,
              viewerSubscription: isWatch(viewerSubscription)
                ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
            }}
            optimisticResponse={{
              updateSubscription: {
                __typename: 'Mutation',
                subscribable: {
                  __typename: 'Repository',
                  id,
                  viewerSubscription: isWatch(viewerSubscription)
                    ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                    : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
                },
              },
            }}
            update={updateWatch}
          >
            {(updateSubscription, { data, loading, error }) => (
              <Button
                className="RepositoryItem-title-action"
                onClick={updateSubscription}
              >
                {watchers.totalCount}{' '}
                {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
              </Button>
            )}
          </Mutation>
      </div>
      <div className="RepositoryItem-title-action">
        {stargazers.totalCount} Stars
      </div>
    </div>

    <div className="RepositoryItem-description">
      <div
        className="RepositoryItem-description-info"
        dangerouslySetInnerHTML={{ __html: descriptionHTML }}
      />
      <div className="RepositoryItem-description-details">
        <div>
          {primaryLanguage && (
            <span>Language: {primaryLanguage.name}</span>
          )}
        </div>
        <div>
          {owner && (
            <span>
              Owner: <a href={owner.url}>{owner.login}</a>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default RepositoryItem;