import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, CardTitle, CardSubtitle, Table } from "reactstrap";
import ReactPaginate from "react-paginate";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pageNumber, setPageNumber] = useState(0); // Current page number
  const usersPerPage = 10; // Number of users to display per page
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [pageNumber]); // Re-fetch users when the page number changes

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/getAllUsers?page=${
          pageNumber + 1
        }&perPage=${usersPerPage}`
      );
      console.log("Response from API:", response.data);  // ! ___FOR_TEST_ONLY_REMEMBER_TO_DELETE_LATER___
      setUsers(response.data.users); // Set users data
      setTotalPages(response.data.totalPages); // Set total number of pages
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

    const handlePageClick = ({ selected }) => {
      setPageNumber(selected);
    };

  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Liste des utilisateurs</CardTitle>
          <CardSubtitle className="mb-2 text-muted" tag="h6">
            Les utilisateurs
          </CardSubtitle>

          <Table className="no-wrap mt-3 align-middle" responsive borderless>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Status</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="border-top">
                  <td>
                    {user.Nom} {user.Prenom}
                  </td>
                  <td>{user.Email}</td>
                  <td>
                    {!user.Verified ? (
                      <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                    ) : (
                      <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                    )}
                  </td>
                  <td>{user.Role}</td>
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
    </div>
  );
};

export default Users;
