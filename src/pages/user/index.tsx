import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

export type User = {
  id: string,
  username: string,
  password: string,
  username_aes: string,
  password_aes: string,
  files: File[]
}

export default function User() {
  // Check if user is logeed in or not
  // If not, redirect to login page
  // If yes, display user page
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userFiles, setUserFiles] = useState<any>(null); // File[]
  const router = useRouter();
  const { user_id } = router.query;

  // Upload file function
  const uploadFile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('file') as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
      formData.append('name', (document.getElementById('name') as HTMLInputElement).value);
      formData.append('user_id', (document.getElementById('user_id') as HTMLInputElement).value);

      axios.post("http://localhost:8080/file/upload", formData)
        .then((res) => {
          // Refresh
          router.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Get the user profile
  useEffect(() => {
    if (user_id) {
      axios.get(`http://localhost:8080/user/decrypted/${user_id}`)
        .then((res) => {
          setUserProfile(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // Get the file by user id
    axios.get(`http://localhost:8080/file/user?user_id=${user_id}`).then((res) => {
      setUserFiles(res.data);
    }).catch((error) => {
      console.log(error);
    });
  }, [user_id]);

  console.log(userProfile)

  // Open the file
  const openFile = (file: any) => {
    axios.get(`http://localhost:8080/file/detail?file_id=${file.id}&encryption_method=${file?.encryption_method}`)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <main className="">
      <div className="mx-auto my-auto w-full min-h-screen flex flex-col border-2 p-4 border-slate-950 gap-4 rounded-lg shadow-2xl">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">Hello, {userProfile?.username_aes}</h1>
        </div>
        <div>
          <form encType="multipart/form-data" onSubmit={uploadFile} className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <label htmlFor="text" className="text-sm">Nama File</label>
              <input type="text" name="name" id="name" className="border rounded-md py-2 px-4" />
            </div>
            <input type="text" hidden name="user_id" id="user_id" value={user_id}/>
            <input type="file" name="file" id="file" />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2 rounded-md text-white">Submit</button>
          </form>
        </div>

        {/* Table files */}
        <table className="px-5 py-5">
          <thead className="border rounded-md bg-sky-900 text-white">
            <tr className="">
              <th>ID</th>
              <th>Nama File</th>
              <th>Tanggal Upload</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="border">
            {userFiles?.map((file: any) => {
              return (
                <tr key={file?.id} className="border">
                  <td className="px-5">{file?.id}</td>
                  <td>{file?.name}</td>
                  <td className="text-center">{file?.created_at}</td>
                  <td className="flex gap-x-3 justify-center">
                    <button className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white" onClick={() => setIsOpen(true)}>Detail</button>
                    <button className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white">Hapus</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Panel>
          <Dialog.Title>Deactivate account</Dialog.Title>
          <Dialog.Description>
            This will permanently deactivate your account
          </Dialog.Description>

          <p>
            Are you sure you want to deactivate your account? All of your data
            will be permanently removed. This action cannot be undone.
          </p>

          <button onClick={() => setIsOpen(false)}>Deactivate</button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </Dialog.Panel>
      </Dialog>
    </main >
  )
}
