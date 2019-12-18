import Axios from 'axios';

// Get accessToken by going to
// https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1
// and clicking Get Token
const accessToken = process.env.DROPBOX_API_TOKEN;

class DataEntry {
  id!: number;

  date!: string;

  systolic!: number;

  diastolic!: number;
}

function createFolder(folderName: string) {
  Axios.post(
    'https://api.dropboxapi.com/2/files/create_folder_v2',
    {
      path: folderName,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )
    .then(function(response: any) {
      console.log(response.data);
    })
    .catch(function(error: any) {
      console.log(error);
    });
}

function initDatabase(fileName: string) {
  Axios.post('https://content.dropboxapi.com/2/files/upload', [], {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': `{ 'path': '${fileName}'}`,
    },
  })
    .then(function(response: any) {
      console.log(response.data);
    })
    .catch(function(error: any) {
      console.log(error);
    });
}

function downloadFile(fileName: string) {
  Axios.post('https://content.dropboxapi.com/2/files/download', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
      'Dropbox-API-Arg': `{ 'path': '${fileName}'}`,
    },
  })
    .then(function(response: any) {
      console.log(response.data);
    })
    .catch(function(error: any) {
      console.log(error);
    });
}

function addEntry(entry: DataEntry, fileName: string) {
  let data: DataEntry[] = [];
  Axios.post('https://content.dropboxapi.com/2/files/download', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
      'Dropbox-API-Arg': `{ 'path': '${fileName}'}`,
    },
  })
    .then(function(response: any) {
      data = response.data;
      console.log(data);
      data.push(entry);

      Axios.post(
        'https://api.dropboxapi.com/2/files/delete_v2',
        {
          path: fileName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )
        .then(function(response2: any) {
          Axios.post('https://content.dropboxapi.com/2/files/upload', data, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/octet-stream',
              'Dropbox-API-Arg': `{ 'path': '${fileName}'}`,
            },
          })
            .then(function(response3: any) {
              console.log(response3.data);
            })
            .catch(function(error: any) {
              console.log(error);
            });
        })
        .catch(function(error: any) {
          console.log(error);
        });
    })
    .catch(function(error: any) {
      console.log(error);
    });
}

function clearData(fileName: string) {
  Axios.post(
    'https://api.dropboxapi.com/2/files/delete_v2',
    {
      path: fileName,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )
    .then(function(response: any) {
      console.log(response);
      Axios.post('https://content.dropboxapi.com/2/files/upload', [], {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': `{ 'path': '${fileName}'}`,
        },
      })
        .then(function(response2: any) {
          console.log(response2.data);
        })
        .catch(function(error: any) {
          console.log(error);
        });
    })
    .catch(function(error: any) {
      console.log(error);
    });
}

// Running all the following functions at once will raise an error
// because the data isn't created yet.
// Probably need some async thing.

// let fileName: string = '/test/sample.json';
// let newEntry: DataEntry = {
//                             id: 1,
//                             date: '12/14/2019',
//                             systolic: 120,
//                             diastolic: 65
//                            };

// Run this
// createFolder('/test');

// Then this
// initDatabase(fileName);

// Then this
// addEntry(newEntry, fileName);
