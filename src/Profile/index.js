import React from 'react';
import gql from 'graphql-tag';
import RepositoryList from '../Repository';
import { Query } from 'react-apollo';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            id
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;

const Profile = () =>(
    <Query query={GET_REPOSITORIES_OF_CURRENT_USER}>
    {({ data, loading  }) => {
      const { viewer } = data;

      if (loading || !viewer) {
        return <div>Loading ...</div>;
      }

      return <RepositoryList repositories={viewer.repositories} />;
    }}
    </Query>
  );

export default Profile;