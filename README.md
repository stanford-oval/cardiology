# Cardiology Project

## Development

### Getting Started

Install all requisite dependencies.

```sh
yarn
```

Run development server.

```sh
yarn start-dev
```

All development work should be done in the `src` directory.

### Testing

Add `TEST_DROPBOX_ACCESSTOKEN` to a `.env` file. An access token can be accessed [here](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1). Then run the tests using Jest.

```sh
yarn test
```