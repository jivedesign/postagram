import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// import { Storage } from "aws-amplify";
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import { css } from '@emotion/css';
import { API, Storage } from 'aws-amplify';
import { listPosts } from './graphql/queries';

import Posts from './Posts';
import Post from './Post';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const Router = (props) => {
  const { user, signOut } = props;
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);

  const fetchPosts = useCallback(async () => {
    let postData = await API.graphql({ 
      query: listPosts, 
      variables: {
        limit: 100
      }
    });
    let postsArray = postData.data.listPosts.items;

    // Map over the image keys in the posts array, get signed image URLs for each image
    postsArray = await Promise.all(postsArray.map(async post => {
      const imageKey = await Storage.get(post.image);
      post.image = imageKey;

      return post;
    }));

    setPostState(postsArray);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const setPostState = async (postsArray) => {
    updatePosts(postsArray);
  };

  return (
    <>
      <HashRouter>
        <div className={contentStyle}>
          <Header />
          <hr className={dividerStyle} />
          <Button title="Sign Out" onClick={signOut} />
          <Button title="New Post" onClick={() => updateOverlayVisibility(true)} />

          <Routes >
            <Route exact path="/" element={<Posts posts={posts} />} />
            <Route path="/post/:id" element={< Post />} />
          </Routes>
        </div>
        {/* Signout button goes here once a new AmplifySignOut component is made (current deprecated) */}
      </HashRouter>
      <Authenticator/>

      {
        showOverlay && (
          <CreatePost
            updateOverlayVisibility={updateOverlayVisibility}
            updatePosts={setPostState}
            posts={posts}
          />
        )
      }
    </>
  )
}

const dividerStyle = css`
  margin-top: 15px;
`

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`

export default withAuthenticator(Router);
