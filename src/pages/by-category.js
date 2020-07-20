import Head from 'next/head';
import Select from 'react-select';
import { Container, ErrorMessage, Article, Loading } from '../components';
import { useState } from 'react';

export default function Home(props) {
  const [articles, setArticles] = useState(props.articles);
  const [errorCode, setErrorCode] = useState(props.errorCode);

  const updateArticles = async (category) => {
    setArticles([]);
    setErrorCode(undefined);

    const data = await getArticlesFromCategory(category);
    const newArticles = data.props.articles;
    const newErrorCode = data.props.errorCode;

    setArticles(newArticles);
    setErrorCode(newErrorCode);
  };

  return (
    <>
      <Head>
        <title>Next.js News &bull; News By Topic</title>
      </Head>

      <Container currentTab={2}>
        <div style={{ marginBottom: '2rem' }}>
          <Select
            defaultValue={props.presetCategory}
            placeholder='Choose a Category...'
            noOptionsMessage={() => 'No Categories Available. This is Likely an Internal Server Error.'}
            options={props.categories}
            onChange={(selectedOptions) => {
              updateArticles(selectedOptions);
            }}
            instanceId={1}
          />
        </div>
        {articles && articles.length > 0 ? (
          <>
            {articles.map((article, idx) => (
              <Article key={idx} article={article} />
            ))}
          </>
        ) : null}
        {errorCode ? (
          <>
            <ErrorMessage>An error occurred while fetching articles with the status code {errorCode}.</ErrorMessage>
          </>
        ) : null}
        {!((articles && articles.length > 0) || errorCode) ? <Loading /> : null}
      </Container>
    </>
  );
}

const getArticlesFromCategory = async (category) => {
  const responseFromAPI = await fetch(`http://localhost:1000/api/by-category?category=${category.value}`);
  if (responseFromAPI.status === 200) {
    return { props: { articles: (await responseFromAPI.json()).articles } };
  } else {
    return { props: { errorCode: responseFromAPI.status } };
  }
};

export async function getServerSideProps() {
  let categories = [];
  const categoriesResponseFromAPI = await fetch('http://localhost:1000/api/categories');
  if (categoriesResponseFromAPI.status === 200) {
    categories = (await categoriesResponseFromAPI.json()).categories.map((e) => {
      return { value: e.id, label: e.name };
    });
  }

  let presetCategory = categories[0] || null;

  let returnVal = await getArticlesFromCategory(presetCategory);
  returnVal.props.categories = categories;
  returnVal.props.presetCategory = presetCategory;

  return returnVal;
}
