import React from 'react';
import { Mutation } from 'react-apollo';
import AddFolderIcon from 'react-icons/lib/md/create-new-folder';
import Input from '@codesandbox/common/lib/components/Input';
import track from '@codesandbox/common/lib/utils/analytics';
import { ESC } from '@codesandbox/common/lib/utils/keycodes';
import { CreateCollection } from 'app/graphql/mutations';
import { PathedSandboxesFolders } from 'app/graphql/queries';
import {
  CreateDirectoryContainer,
  IconContainer,
  AnimatedChevron,
} from './elements';

interface Props {
  basePath: string;
  teamId: string | undefined;
  close: () => void;
  depth: number;
  noFocus?: boolean;
}

export default ({ basePath, teamId, noFocus, close, depth }: Props) => {
  let input;
  return (
    <Mutation mutation={CreateCollection}>
      {mutate => (
        <form
          onSubmit={e => {
            e.preventDefault();
            const path = basePath + '/' + input.value;

            track('Dashboard - Create Directory', {
              path,
            });

            mutate({
              variables: { path, teamId },
              optimisticResponse: {
                __typename: 'Mutation',
                createCollection: {
                  id: 'optimistic-id',
                  path,
                  __typename: 'Collection',
                },
              },
              update: (proxy, { data: { createCollection } }) => {
                const variables: { teamId?: string } = {};
                if (teamId) {
                  variables.teamId = teamId;
                }
                // Read the data from our cache for this query.
                const d: { me: any } = proxy.readQuery({
                  query: PathedSandboxesFolders,
                  variables,
                });

                // Add our collection from the mutation to the end.
                d.me.collections.push(createCollection);
                // Write our data back to the cache.
                proxy.writeQuery({
                  query: PathedSandboxesFolders,
                  variables,
                  data: d,
                });
              },
            });

            input.value = '';

            close();
          }}
        >
          <CreateDirectoryContainer depth={depth + 1}>
            <IconContainer style={{ marginRight: '0.25rem' }}>
              <AnimatedChevron open={false} />
              <AddFolderIcon />
            </IconContainer>{' '}
            <Input
              placeholder="Folder Name"
              style={{ marginRight: '1rem' }}
              onBlur={close}
              onKeyDown={e => {
                if (e.keyCode === ESC) {
                  e.preventDefault();
                  close();
                }
              }}
              ref={el => {
                if (el) {
                  if (!noFocus) {
                    el.focus();
                    el.select();
                  }
                  input = el;
                }
              }}
              block
            />
          </CreateDirectoryContainer>
        </form>
      )}
    </Mutation>
  );
};
