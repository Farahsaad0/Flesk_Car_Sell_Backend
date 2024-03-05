import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Row, Col, Table, Card, CardTitle, CardBody } from "reactstrap";
import ReactPaginate from "react-paginate";

const ExpertsSubs = () => {
  const [pendingExperts, setPendingExperts] = useState([]);
  const [pageNumber, setPageNumber] = useState(0); // Current page number
  const usersPerPage = 10; // Number of users to display per page
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Fetch Pending Experts data from the server when the component mounts
    fetchPendingExperts();
  }, [pageNumber]);

  const fetchPendingExperts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/getPendingExperts?page=${
          pageNumber + 1
        }&perPage=${usersPerPage}`
      );
      setPendingExperts(response.data.pendingExperts);
      setTotalPages(response.data.totalPages); // Set total number of pages
    } catch (error) {
      console.error("Error fetching pending experts:", error);
    }
  };

  const handlePageClick = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            Demondes des Experts
          </CardTitle>
          <CardBody className="">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>email</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {pendingExperts.map((PExpert, index) => (
                  <tr key={index}>
                    <td>
                      {PExpert.Nom} {PExpert.Prenom}
                    </td>
                    <td>{PExpert.Email}</td>
                    <td>
                      <Button className="btn" color="success" size="sm">
                        accepter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <nav aria-label="Page navigation ">
              <ul class="pagination justify-content-center">
                <ReactPaginate
                  previousLabel={
                    <li class="page-item">
                      <a class="page-link">Previous</a>
                    </li>
                  }
                  nextLabel={<a class="page-link">Next</a>}
                  pageCount={totalPages} // Total number of pages, calculate based on total users count and usersPerPage
                  onPageChange={handlePageClick}
                  containerClassName={"pagination "}
                  activeClassName={" active"}
                  pageClassName={"page-item"} // Style for inactive page numbers
                  pageLinkClassName={"page-link"} // Style for inactive page number links
                />
              </ul>
            </nav>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ExpertsSubs;
