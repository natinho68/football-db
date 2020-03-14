import React from 'react';
import './styles/style.scss';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import classNames from 'classnames';
import { getCode } from 'country-list';
import Flag from 'react-country-flags';

const SignupSchema = Yup.object().shape({
  playerName: Yup.string()
    .min(2, 'Name too Short!')
    .max(50, 'Name too long!')
    .required('Name required')
});

const Loader = () => {
  return (
    <div className="dot-loader">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
};

const SearchResult = ({ data, playerName }) => {
  console.log(data);

  return (
    <div id="result">
      <h2 className="result-title">Search results for: {playerName}</h2>
      <div id="container-result">
        {data.map(item => {
          const backgroundColor = classNames({
            goalkeeper: item.position === 'Goalkeeper',
            attacker: item.position === 'Attacker',
            midfielder: item.position === 'Midfielder',
            defender: item.position === 'Defender'
          });
          const borderColor = classNames({
            'border-goalkeeper': item.position === 'Goalkeeper',
            'border-attacker': item.position === 'Attacker',
            'border-midfielder': item.position === 'Midfielder',
            'border-defender': item.position === 'Defender'
          });
          let countryName = null;
          if (item.nationality !== null) {
            const getCountryCode = getCode(item.nationality);
            if (getCountryCode !== undefined) {
              countryName = getCountryCode.toLowerCase();
            }
          }
          return (
            <div key={item.player_id} className={'card ' + borderColor}>
              <div className="position">
                <p className={backgroundColor}>{item.position}</p>
              </div>
              <div>
                <div>
                  <h4 className="playerName">{item.player_name}</h4>
                  {countryName ? (
                    <Flag
                      className="flag"
                      country={countryName}
                      asSquare={true}
                    />
                  ) : (
                    <p>{item.nationality}</p>
                  )}
                </div>
                <span>
                  Full name: {item.firstname} {item.lastname} <br />
                  Age: {item.age}
                  <br />
                  Height: {item.height}
                  <br />
                  Weight: {item.weight}
                  <br />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => {
  const [text, setText] = React.useState('Look for this guy !');
  const [data, setData] = React.useState(null);
  const [playerName, setPlayerName] = React.useState('');
  const changeButtonContent = text => {
    setText(text);
  };

  return (
    <div>
      <div id={'container'}>
        <div className="cover-bg" />
        <div className="title">
          <h1 className="home-title">Looking for a player?</h1>
        </div>
        <div className="box">
          <Formik
            initialValues={{
              playerName: ''
            }}
            validationSchema={SignupSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              changeButtonContent(<Loader />);
              (async () => {
                const response = await axios.get(
                  './data/response_firstsearch.json'
                );
                if (response.status === 200 && response.data.api.results > 0) {
                  changeButtonContent('Results ↓');
                  setInterval(() => {
                    changeButtonContent('Look for this guy !');
                  }, 15000);
                  setSubmitting(false);
                  setPlayerName(values.playerName);
                  setData(response.data.api.players);
                } else if (response.data.api.results === 0) {
                  setFieldError('playerName', 'No results found');
                } else {
                  setFieldError('playerName', 'Error with db connection');
                }
              })();
            }}
          >
            {({ isValid, errors }) => (
              <Form>
                <div className="form__group field">
                  <Field
                    className="form__field"
                    placeholder="name"
                    name="playerName"
                    autocomplete="off"
                    required
                  />
                  <label htmlFor="playerName" className="form__label">
                    Name
                  </label>
                  <button
                    type="submit"
                    className="btn draw-border"
                    disabled={!isValid}
                  >
                    {!isValid ? errors.playerName : text}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {data && <SearchResult data={data} playerName={playerName} />}
    </div>
  );
};

const App = () => {
  return <Home />;
};

export default App;
