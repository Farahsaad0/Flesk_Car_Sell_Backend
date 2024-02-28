import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
  const [data, setData] = useState({ Email: "", Password: "" });
  const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8000/login"; // Endpoint de connexion
      const response = await axios.post(url, data);
      const { _id, Nom, Prenom, Email, Role, token } = response.data; // Extraction des données de l'utilisateur et du token
      localStorage.setItem("token", token);

      window.location = "/"; // Redirection vers la page d'accueil après la connexion réussie
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data); // Affichage de l'erreur renvoyée par l'API
      } else {
        setError("Une erreur s'est produite lors de la connexion."); // Message d'erreur générique en cas d'erreur inattendue
      }
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Se Connecter</h1>
            <input
              type="email"
              placeholder="Email"
              name="Email"
              onChange={handleChange}
              value={data.Email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Mot de passe "
              name="Password"
              onChange={handleChange}
              value={data.Password}
              required
              className={styles.input}
            />
            {error && <div className={styles.error_msg}>{error}</div>}
            <button type="submit" className={styles.green_btn}>
              Se connecter
            </button>
          </form>
        </div>
        <div className={styles.right}>
          <h1>Nouveau Compte?</h1>
          <Link to="/signup">
            <button type="button" className={styles.white_btn}>
              S'inscrire
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
