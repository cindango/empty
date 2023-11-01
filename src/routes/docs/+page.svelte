<script>

    export let data;

    $: ({ session } = data);

    let profileForm;
    let loading = false;
    let fullName = data.profile?.full_name ?? '';
    let username = data.profile?.username ?? '';
    let website = data.profile?.website ?? '';
    let avatarUrl = data.profile?.avatar_url ?? '';
  
  </script>
  
  <main>
    <h1>{username}</h1>
    {#each data.documents as doc, index}

    <a class="document-link" href="/{username}/{doc.document_id}">
        <div class="document">
            <h2>{doc.title}</h2>
        </div>
    </a>

    {/each}
  </main>
  
  <style>
    .document {
        border: 1px solid;
        padding: 20px;
    }
    a.document-link:hover .document {
        opacity: .8;
    }
  </style>