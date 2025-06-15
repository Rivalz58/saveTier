import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/Admin.css";

interface User {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

interface Role {
  id: number;
  libelle: string;
}

interface UsersResponse {
  status: string;
  message: string;
  data: User[];
}

interface RolesResponse {
  status: string;
  message: string;
  data: Role[];
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // États pour la modal
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<
    "quarantine" | "delete" | "role"
  >("quarantine");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Charger les utilisateurs et les rôles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersResponse, rolesResponse] = await Promise.all([
          api.get<UsersResponse>("/user"),
          api.get<RolesResponse>("/role"),
        ]);

        setUsers(usersResponse.data.data);
        setRoles(rolesResponse.data.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer et trier les utilisateurs
  const getFilteredUsers = () => {
    return users
      .filter((user) => {
        // Filtre de recherche
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          user.username.toLowerCase().includes(searchLower) ||
          user.nametag.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);

        // Filtre de statut
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;

        // Filtre de rôle
        const matchesRole =
          roleFilter === "all" ||
          user.roles.some((role) => role.id.toString() === roleFilter);

        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort((a, b) => {
        // Tri
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "alphabetical":
            return a.username.localeCompare(b.username);
          case "last_connection":
            return (
              new Date(b.last_connection).getTime() -
              new Date(a.last_connection).getTime()
            );
          default:
            return 0;
        }
      });
  };

  // Modifier le statut d'un utilisateur
  const handleToggleStatus = async (user: User) => {
    try {
      setIsActionLoading(true);

      // Utiliser "desactive" au lieu de "quarantined" pour correspondre à l'API
      const newStatus = user.status === "active" ? "desactive" : "active";

      console.log(
        `Tentative de modification du statut pour l'utilisateur ${user.id}:`,
        {
          ancienStatut: user.status,
          nouveauStatut: newStatus,
        },
      );

      // Envoyer la requête à l'API
      const response = await api.put(`/user/${user.id}`, {
        status: newStatus,
      });

      console.log("Réponse de l'API pour changement de statut:", response.data);

      // Mettre à jour l'état local
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
      );

      alert(
        `Le statut de l'utilisateur ${user.username} a été modifié avec succès.`,
      );
    } catch (err) {
      console.error(
        "Erreur lors de la modification du statut de l'utilisateur:",
        err,
      );

      alert("Une erreur est survenue lors de la modification du statut.");
    } finally {
      setIsActionLoading(false);
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (user: User) => {
    try {
      setIsActionLoading(true);

      await api.delete(`/user/${user.id}`);

      // Mettre à jour l'état local
      setUsers(users.filter((u) => u.id !== user.id));

      alert(`L'utilisateur ${user.username} a été supprimé avec succès.`);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
      alert("Une erreur est survenue lors de la suppression de l'utilisateur.");
    } finally {
      setIsActionLoading(false);
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  // Ajouter un rôle à un utilisateur
  const handleAddRole = async (user: User, roleId: number) => {
    try {
      if (!roleId) {
        alert("Veuillez sélectionner un rôle.");
        return;
      }

      setIsActionLoading(true);

      // Obtenir le rôle ajouté
      const addedRole = roles.find((r) => r.id === roleId);
      if (!addedRole) {
        alert("Rôle non trouvé.");
        return;
      }

      // Vérifier si l'utilisateur a déjà ce rôle
      const hasRole = user.roles.some((r) => r.id === roleId);
      if (hasRole) {
        alert("L'utilisateur possède déjà ce rôle.");
        return;
      }

      console.log(
        `Tentative d'ajout du rôle ${roleId} pour l'utilisateur ${user.id}`,
        {
          userId: user.id,
          roleId: roleId,
          endpoint: `/user/${user.id}/role/${roleId}`,
        },
      );

      try {
        // Faire l'appel API
        const response = await api.post(`/user/${user.id}/role`, {
          id_role: roleId,
        });
        console.log("Réponse API pour ajout de rôle:", response.data);

        // Mettre à jour l'état local en cas de succès
        setUsers(
          users.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                roles: [...u.roles, addedRole],
              };
            }
            return u;
          }),
        );

        alert(
          `Le rôle a été ajouté à l'utilisateur ${user.username} avec succès.`,
        );
      } catch (apiError) {
        console.error("Erreur lors de l'ajout du rôle:", apiError);

        // Message indiquant que l'opération a peut-être réussi malgré l'erreur
        alert(
          `Une erreur s'est produite, mais le rôle a peut-être été ajouté. Nous actualisons la liste des utilisateurs.`,
        );

        // Recharger les utilisateurs pour voir si le rôle a bien été ajouté
        try {
          const refreshResponse = await api.get<UsersResponse>("/user");
          setUsers(refreshResponse.data.data);
        } catch (refreshError) {
          console.error(
            "Erreur lors du rafraîchissement des données:",
            refreshError,
          );
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du rôle:", err);
      alert("Une erreur est survenue lors de l'ajout du rôle.");
    } finally {
      setIsActionLoading(false);
      setShowModal(false);
      setSelectedUser(null);
      setSelectedRole(null);
    }
  };

  // Supprimer un rôle d'un utilisateur
  const handleRemoveRole = async (user: User, roleId: number) => {
    try {
      setIsActionLoading(true);

      console.log(
        `Tentative de suppression du rôle ${roleId} pour l'utilisateur ${user.id}`,
        {
          userId: user.id,
          roleId: roleId,
          endpoint: `/user/${user.id}/role/${roleId}`,
        },
      );

      try {
        const response = await api.delete(`/user/${user.id}/role`, {
          id_role: roleId,
        });
        console.log("Réponse API pour suppression de rôle:", response.data);

        // Mettre à jour l'état local
        setUsers(
          users.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                roles: u.roles.filter((r) => r.id !== roleId),
              };
            }
            return u;
          }),
        );

        alert(
          `Le rôle a été retiré de l'utilisateur ${user.username} avec succès.`,
        );
      } catch (apiError) {
        console.error("Erreur lors de la suppression du rôle:", apiError);

        // Enregistrer les détails de l'erreur

        // Message indiquant que l'opération a peut-être réussi malgré l'erreur
        alert(
          `Une erreur s'est produite, mais le rôle a peut-être été retiré. Nous actualisons la liste des utilisateurs.`,
        );

        // Recharger les utilisateurs pour voir si le rôle a bien été retiré
        try {
          const refreshResponse = await api.get<UsersResponse>("/user");
          setUsers(refreshResponse.data.data);
        } catch (refreshError) {
          console.error(
            "Erreur lors du rafraîchissement des données:",
            refreshError,
          );
        }
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du rôle:", err);
      alert("Une erreur est survenue lors de la suppression du rôle.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Affiche la modal de confirmation
  const openConfirmationModal = (
    action: "quarantine" | "delete" | "role",
    user: User,
  ) => {
    setSelectedUser(user);
    setModalAction(action);
    setSelectedRole(null);
    setShowModal(true);
  };

  // Traite l'action confirmée dans la modal
  const handleConfirmAction = () => {
    if (!selectedUser) return;

    switch (modalAction) {
      case "quarantine":
        handleToggleStatus(selectedUser);
        break;
      case "delete":
        handleDeleteUser(selectedUser);
        break;
      case "role":
        if (selectedRole) {
          handleAddRole(selectedUser, selectedRole);
        }
        break;
    }
  };

  // Rendu du tableau d'utilisateurs filtré
  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-table-container">
      <div className="admin-toolbar">
        <div className="admin-search-container">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search"
          />
        </div>
        <div className="admin-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="desactive">Désactivés</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                {role.libelle}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-filter-select"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="alphabetical">Alphabétique</option>
            <option value="last_connection">Dernière connexion</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>Aucun utilisateur ne correspond à votre recherche</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Nametag</th>
              <th>Email</th>
              <th>Inscription</th>
              <th>Dernière connexion</th>
              <th>Statut</th>
              <th>Rôles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="id-cell">{user.id}</td>
                <td>{user.username}</td>
                <td>{user.nametag}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{new Date(user.last_connection).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === "active" ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td>
                  <div className="user-roles">
                    {user.roles.map((role) => (
                      <div key={role.id} className="user-role">
                        {role.libelle}
                        <button
                          className="remove-role-btn"
                          onClick={() => handleRemoveRole(user, role.id)}
                          title="Retirer ce rôle"
                          disabled={isActionLoading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-role-btn"
                      onClick={() => openConfirmationModal("role", user)}
                      title="Ajouter un rôle"
                      disabled={isActionLoading}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="actions-cell">
                  <button
                    className="admin-action-btn quarantine"
                    onClick={() => openConfirmationModal("quarantine", user)}
                    disabled={isActionLoading}
                  >
                    {user.status === "desactive" ? "Réactiver" : "Désactiver"}
                  </button>
                  <button
                    className="admin-action-btn delete"
                    onClick={() => openConfirmationModal("delete", user)}
                    disabled={isActionLoading}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de confirmation */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmation</h2>
            {modalAction === "quarantine" && (
              <p>
                Êtes-vous sûr de vouloir{" "}
                {selectedUser?.status === "desactive"
                  ? "réactiver"
                  : "désactiver"}{" "}
                l'utilisateur <strong>{selectedUser?.username}</strong> ?
              </p>
            )}
            {modalAction === "delete" && (
              <p>
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <strong>{selectedUser?.username}</strong> ? Cette action est
                irréversible.
              </p>
            )}
            {modalAction === "role" && (
              <div>
                <p>
                  Sélectionnez le rôle à ajouter à l'utilisateur{" "}
                  <strong>{selectedUser?.username}</strong> :
                </p>
                <select
                  value={selectedRole || ""}
                  onChange={(e) => setSelectedRole(Number(e.target.value))}
                  className="role-select"
                  disabled={isActionLoading}
                >
                  <option value="">-- Sélectionnez un rôle --</option>
                  {roles
                    .filter(
                      (role) =>
                        !selectedUser?.roles.some((r) => r.id === role.id),
                    )
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.libelle}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                disabled={isActionLoading}
              >
                Annuler
              </button>
              <button
                className={`confirm-${modalAction}`}
                onClick={handleConfirmAction}
                disabled={
                  (modalAction === "role" && !selectedRole) || isActionLoading
                }
              >
                {isActionLoading ? "Traitement en cours..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
