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
  Divider,
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

/* Custom Header for the Login Box */
const components = {
  Header() {
    return (
      <View textAlign="center" padding="2rem 0 1rem 0">
        <View
          style={{
            backgroundColor: '#FEF3C7', /* Very Light Yellow */
            color: '#D97706', /* Dark Yellow Text */
            borderRadius: '50px',
            padding: '5px 15px',
            display: 'inline-block',
            marginBottom: '15px',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '1px'
          }}
        >
          DREAM BIG
        </View>
        <Heading level={3} color="#111827" fontWeight="800">
          Welcome Back
        </Heading>
        <Text color="#6B7280" fontSize="0.9rem">
          Login to manage your bucket list
        </Text>
      </View>
    );
  },
};

// --- LOGIC MOVED HERE (DASHBOARD COMPONENT) ---
// This component will be fully reset every time the user switches/logs out
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

  // --- RETURNING YOUR ORIGINAL UI ---
  return (
    <View className="App">
      {/* Main App Hero Section */}
      <Heading level={1} className="app-title">
        Your Bucket List
      </Heading>
      <Text className="app-subtitle">
        Capture your dreams, one at a time.
      </Text>

      {/* Input Form Card */}
      <View as="form" onSubmit={createItem} className="form-container">
        <Flex direction="column" gap="1.5rem">
          <TextField
            name="title"
            placeholder="What do you want to achieve?"
            label="Bucket List Item"
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Details (Cost, Date, Plan)"
            label="Description"
            variation="quiet"
            required
          />

          {/* File Upload Styling */}
          <View
            style={{
              border: '2px dashed #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#F9FAFB',
              cursor: 'pointer'
            }}
          >
            <input
              name="image"
              type="file"
              accept="image/png, image/jpeg"
              style={{ width: '100%', color: '#6B7280' }}
            />
          </View>

          <Button type="submit" variation="primary">
            Add to List
          </Button>
        </Flex>
      </View>

      <Divider style={{ margin: '4rem 0', opacity: 0.5 }} />

      <Flex justifyContent="space-between" alignItems="center" marginBottom="2rem">
        <Heading level={2} color="#111827">
          Your Goals
        </Heading>
        <View
          backgroundColor="#F3F4F6"
          padding="5px 15px"
          borderRadius="20px"
          color="#6B7280"
          fontWeight="600"
        >
          {items.length} Items
        </View>
      </Flex>

      {/* Cards Grid */}
      <div className="card-grid">
        {items.map((item) => (
          <div key={item.id || item.title} className="box">
            <Heading level={3}>{item.title}</Heading>
            <Text fontStyle="italic" color="#6B7280" style={{ marginBottom: '15px', display: 'block' }}>
              {item.description}
            </Text>

            {item.image && (
              <Image
                src={item.image}
                alt={`Visual for ${item.title}`}
                className="card-image"
              />
            )}

            <Button
              className="delete-btn"
              onClick={() => deleteItem(item)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={signOut} className="sign-out-btn">
        Sign Out
      </Button>
    </View>
  );
}

// --- MAIN APP ONLY CALLS AUTHENTICATOR ---
export default function App() {
  return (
    <Authenticator components={components}>
      {({ signOut }) => <Dashboard signOut={signOut} />}
    </Authenticator>
  );
}