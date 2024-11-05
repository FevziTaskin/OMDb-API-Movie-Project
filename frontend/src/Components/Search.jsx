import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

const defaultPoster =
  "https://eticketsolutions.com/demo/themes/e-ticket/img/movie.jpg"; // Default image URL

const years = Array.from({ length: 2024 - 1970 + 1 }, (_, i) => 1970 + i); // Array of years from 1990 to 2024

const Search = ({ credentials }) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!credentials.username || !credentials.password) {
      navigate("/authentication"); // Navigate to authentication page if not authenticated
    }
  }, [credentials, navigate]);

  const fetchData = useCallback(
    async (page) => {
      try {
        const authString = `${credentials.username}:${credentials.password}`;
        const base64AuthString = btoa(authString); // Convert to Base64

        const response = await fetch(
          `http://localhost:8000/movies?query=${query}&type=${type}&year=${year}&page=${page}`,
          {
            headers: {
              Authorization: `Basic ${base64AuthString}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data.Search || []);
        setTotalResults(data.totalResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [credentials.username, credentials.password, query, type, year]
  );

  useEffect(() => {
    if (query || type || year) {
      setResults([]); // Clear previous results
      setPage(1); // Reset to first page
      fetchData(page); // Fetch first page
    }
  }, [
    credentials.password,
    credentials.username,
    fetchData,
    page,
    query,
    type,
    year,
  ]);

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
    fetchData(pageNumber);
  };

  const totalPages = Math.ceil(totalResults / 10); // Assuming 10 results per page

  return (
    <Container>
      <h2>Search Page</h2>
      <Form>
        <FormGroup>
          <Label for="query">Search:</Label>
          <Input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "300px" }}
          />
        </FormGroup>
        <FormGroup>
          <Label for="type">Type:</Label>
          <Input
            type="select"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "300px" }}
          >
            <option value="">Select Type</option>
            <option value="movie">movie</option>
            <option value="series">series</option>
            <option value="episode">episode</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="year">Year:</Label>
          <Input
            type="select"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: "300px" }}
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Input>
        </FormGroup>
      </Form>

      <div>
        <h3>Results:</h3>
        <Row>
          {results.map((item) => (
            <Col
              key={item.imdbID}
              xs="12"
              sm="6"
              md="4"
              lg="3"
              className="mb-4"
            >
              <Card className="h-100">
                <CardImg
                  top
                  width="100%"
                  src={item.Poster !== "N/A" ? item.Poster : defaultPoster}
                  alt={item.Title}
                  style={{
                    height: "350px",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
                <CardBody>
                  <CardTitle tag="h5">{item.Title}</CardTitle>
                  <CardText>{item.Year}</CardText>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="d-flex justify-content-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              onClick={() => handlePageClick(index + 1)}
              className="me-2"
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Search;
