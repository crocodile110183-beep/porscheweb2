import { onAuthChanged } from "./auth.js";
import { subscribePendingListings, approveListing, rejectListing } from "./firestoreService.js";

const container = document.getElementById("pendingList");

function render(items, currentUser) {
    if (!container) return;
    if (!items || items.length === 0) {
        container.innerHTML = "<p>No pending listings.</p>";
        return;
    }

    container.innerHTML = items.map(it => {
        const title = it.title || it.carModel || "Untitled";
        const desc = (it.description || "").length > 300 ? (it.description || "").slice(0, 300) + "…" : (it.description || "");
        const owner = it.ownerEmail || it.ownerId || "N/A";
        const img = it.imageUrl || "https://via.placeholder.com/180x110?text=No+Image";
        return `
      <div class="card" data-id="${it.id}">
        <img class="thumb" src="${img}" alt="thumb">
        <div style="flex:1">
          <h3 style="margin:0 0 8px 0">${title}</h3>
          <div class="muted">${desc}</div>
          <div class="muted" style="margin-top:8px"><strong>Owner:</strong> ${owner}</div>
          <div class="actions">
            <button class="approve" data-id="${it.id}">Approve</button>
            <button class="reject" data-id="${it.id}">Reject</button>
          </div>
        </div>
      </div>
    `;
    }).join("");

    attachHandlers(currentUser);
}

function attachHandlers(currentUser) {
    container.querySelectorAll(".approve").forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!confirm("Approve this listing?")) return;
            try {
                await approveListing(id, { uid: currentUser.uid });
                alert("Listing approved.");
            } catch (err) {
                console.error(err);
                alert("Failed to approve. See console.");
            }
        };
    });

    container.querySelectorAll(".reject").forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.currentTarget.dataset.id;
            const reason = prompt("Reason for rejection (optional):") || null;
            if (!confirm("Reject this listing?")) return;
            try {
                await rejectListing(id, { uid: currentUser.uid }, reason);
                alert("Listing rejected.");
            } catch (err) {
                console.error(err);
                alert("Failed to reject. See console.");
            }
        };
    });
}

const ADMIN_EMAILS = ["pjantankjoi@gmail.com"];

onAuthChanged((user) => {
    if (!user) {
        container.innerHTML = "<p>Please sign in to access moderation.</p>";
        return;
    }

    const isAdmin = ADMIN_EMAILS.includes((user.email || "").toLowerCase());
    if (!isAdmin) {
        container.innerHTML = "<p>Access denied — you are not an admin.</p>";
        return;
    }

    subscribePendingListings((items) => render(items, user));
});
