import React, { useState, useCallback, useEffect } from 'react'
import { css } from '@emotion/css';
import { useParams } from 'react-router-dom';
import { API, Storage } from 'aws-amplify';
import { getPost } from './graphql/queries';

export default function Post() {
  const [loading, updateLoading] = useState(true);
  const [post, updatePost] = useState(null);
  const { id } = useParams()

  const fetchPost = useCallback( async () => {
    try {
      const postData = await API.graphql({
        query: getPost, variables: { id }
      });
      const currentPost = postData.data.getPost
      const image = await Storage.get(currentPost.image);

      currentPost.image = image;
      updatePost(currentPost);
      updateLoading(false);
    } catch (err) {
      console.log('error: ', err)
    }
  }, [id]);

  useEffect(() => {
    fetchPost()
  }, [fetchPost]);

  if (loading) return <h3>Loading...</h3>

  return (
    <div>
      <h1 className={titleStyle}>{post.name}</h1>
      <h3 className={locationStyle}>{post.location}</h3>
      <p>{post.description}</p>
      <img alt="post" src={post.image} className={imageStyle} />
    </div>
  )
}

const titleStyle = css`
  margin-bottom: 7px;
`

const locationStyle = css`
  color: #0070f3;
  margin: 0;
`

const imageStyle = css`
  max-width: 500px;
  @media (max-width: 500px) {
    width: 100%;
  }
`