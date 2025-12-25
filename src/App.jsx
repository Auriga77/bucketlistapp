import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
  Card,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl, uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

function Dashboard({ signOut }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data: items } = await client.models.BucketItem.list();
    await Promise.all(
      items.map(async (item) => {
        if (item.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${item.image}`,
          });
          item.image = linkToStorageFile.url;
        }
        return item;
      })
    );
    setItems(items);
  }

  async function createItem(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const { data: newItem } = await client.models.BucketItem.create({
      title: form.get("title"),
      description: form.get("description"),
      image: form.get("image").name,
    });
    if (newItem.image)
      await uploadData({
        path: ({ identityId }) => `media/${identityId}/${newItem.image}`,
        data: form.get("image"),
      }).result;
    fetchItems();
    event.target.reset();
  }

  async function deleteItem({ id }) {
    const toBeDeletedItem = { id: id };
    await client.models.BucketItem.delete(toBeDeletedItem);
    fetchItems();
  }

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="100%"
      maxWidth="800px"
      margin="0 auto"
      padding="2rem"
    >
      <Heading level={1}>My Bucket List</Heading>

      {/* FORM INPUT */}
      <View as="form" margin="2rem 0" onSubmit={createItem} width="100%">
        <Flex direction="column" gap="1rem">
          <TextField
            name="title"
            placeholder="Bucket List Item"
            label="Bucket List Item"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Description"
            label="Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            accept="image/png, image/jpeg"
            style={{ padding: "0.5rem" }}
          />
          <Button type="submit" variation="primary">
            Add to Bucket List
          </Button>
        </Flex>
      </View>

      <Divider />
      <Heading level={2} margin="1.5rem 0">My Goals</Heading>

      {/* GRID LAYOUT YANG RAPI */}
      <Grid
        templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
        gap="1.5rem"
        width="100%"
      >
        {items.map((item) => (
          <Card
            key={item.id || item.title}
            variation="elevated"
            borderRadius="medium"
            padding="1.5rem"
          >
            <Flex direction="column" gap="1rem" alignItems="flex-start">
              <Heading level={4}>{item.title}</Heading>
              <Text fontSize="0.9rem" color="gray.80">{item.description}</Text>

              {item.image && (
                <Image
                  src={item.image}
                  alt={`Visual for ${item.title}`}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <Button
                variation="destructive"
                isFullWidth
                onClick={() => deleteItem(item)}
                size="small"
              >
                Remove
              </Button>
            </Flex>
          </Card>
        ))}
      </Grid>

      <Button onClick={signOut} variation="link" marginTop="2rem">
        Sign Out
      </Button>
    </Flex>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut }) => <Dashboard signOut={signOut} />}
    </Authenticator>
  );
}