import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

const Authentication = ({ setAuth, setCredentials }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authString = `${username}:${password}`;
      const base64AuthString = btoa(authString); // Encode in Base64

      // Make a request to the backend to validate the credentials
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64AuthString}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Authentication successful
        setAuth(true);
        setCredentials({ username, password });
        setErrorMessage("");
        navigate("/search");
      } else {
        // Authentication failed (401 response)
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
    // Clear input fields
    setUsername("");
    setPassword("");
  };

  return (
    <Container>
      <h2>Authentication Page</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="username">Username:</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "300px" }}
          />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password:</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "300px" }}
          />
        </FormGroup>
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Form>

      {errorMessage && (
        <Alert color="danger" className="mt-3" style={{ width: "300px" }}>
          {errorMessage}
        </Alert>
      )}
    </Container>
  );
};

export default Authentication;
