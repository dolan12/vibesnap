import React ,{useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from "axios";
import { toast } from 'sonner';
import { useDispatch} from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const SuggestedUsers =() => {
    const { suggestedUsers,user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleFollowToggle=async (user1)=>{
       try {
        setLoading(true);
        const res = await axios.post(
            `http://localhost:8000/api/v1/user/followorunfollow/${user1}`, // targetUserId = req.params.id
            {},
            {
              headers: {
                Authorization: `Bearer ${user}`,
              },
              withCredentials: true,
            });
        if (res.data.success) {
            const updatedUser=await axios.get(`http://localhost:8000/api/v1/user/${user._id}/getuser`);
            dispatch(setAuthUser(updatedUser.data.user));
            toast.success(res.data.message);
        }
       } catch (err) {
        console.log(err);
       }finally {
        setLoading(false);}
    }
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {   
                suggestedUsers.map((user1) => {
                    return (
                        <div key={user1._id} className='flex items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${user1?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={user1?.profilePicture} alt="post_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user1?._id}`}>{user1?.username}</Link></h1>
                                    <span className='text-gray-600 text-sm'>{user1?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            {/* <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={handleFollow}>Follow</span> */}
                            <span
                                className={`text-xs font-bold cursor-pointer ${user?.following.includes(user1._id) ? 'text-red-500' : 'text-[#3BADF8] hover:text-[#3495d6]'}`}
                                onClick={() => handleFollowToggle(user1._id)}
                            >
                                {user?.following.includes(user1._id) ? 'Unfollow' : 'Follow'}
                            </span>
                        </div>
                    )
                })
                
            }

        </div>
    )
}

export default SuggestedUsers;

