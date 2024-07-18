const data = [
  {
    hostname: "youtube.com",
  },
  {
    hostname: "facebook.com",
  },
];

const store = (formBody: any) => {
  return new Promise((resolve) => {
    data.push({
      hostname: formBody.blocked_website,
    });
    resolve(data);
  });
};

export default {
  data,
  store,
};
