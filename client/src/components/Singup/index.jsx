import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
  const [data, setData] = useState({
    Prenom: "",
    Nom: "",
    Email: "",
    Password: "",
    Role: "",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8000/register";
      const { data: res } = await axios.post(url, data);
      setIsRegistered(true); // Définir l'état de la validation sur true
      setMsg(res.message);
      setEmailSent(true); // Définir l'état de l'e-mail envoyé sur true
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      const url = "http://localhost:8000/verify";
      const { data: res } = await axios.post(url, {
        email: data.Email,
        verificationCode: verificationCode
      });
      setIsRegistered(true); // Définir l'état de la validation sur true
      setMsg(res.message);
    } catch (error) {
      setError("Code de vérification invalide.");
    }
  };
  

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Bienvenue</h1>
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Se connecter
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Créer Compte</h1>
            <input
              type="text"
              placeholder="Prenom"
              name="Prenom"
              onChange={handleChange}
              value={data.Prenom}
              required
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Nom"
              name="Nom"
              onChange={handleChange}
              value={data.Nom}
              required
              className={styles.input}
            />
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
              placeholder="Mot de passe"
              name="Password"
              onChange={handleChange}
              value={data.Password}
              required
              className={styles.input}
            />

            {emailSent && (
            <div>
            <input
              type="text"
              placeholder="Code de vérification"
              name="verificationCode"
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
              required
              className={styles.input}
            />
            <button onClick={handleVerificationSubmit}>Valider</button>
          </div>
            )}

            <div className={styles.radio_group}>
              <label>
                <input
                  type="radio"
                  name="Role"
                  value="Acheteur"
                  onChange={handleChange}
                  checked={data.Role === "Acheteur"}
                />
                Acheteur
              </label>
              <label>
                <input
                  type="radio"
                  name="Role"
                  value="Vendeur"
                  onChange={handleChange}
                  checked={data.Role === "Vendeur"}
                />
                Vendeur
              </label>
              <label>
                <input
                  type="radio"
                  name="Role"
                  value="Expert"
                  onChange={handleChange}
                  checked={data.Role === "Expert"}
                />
                Expert
              </label>
            </div>
            {error && <div className={styles.error_msg}>{error}</div>}
            {msg && <div className={styles.success_msg}>{msg}</div>}
            {isRegistered && (
              <div className={styles.success_msg}>Inscription réussie</div>
            )}
            <button type="submit" className={styles.green_btn}>
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
