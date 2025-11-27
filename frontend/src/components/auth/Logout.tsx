import { Button } from '../ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

const Logout = () =>{
    const {signout} = useAuthStore()
    const navigate = useNavigate()
    const handleSignOut = async () => {
      try {
        await signout()
        navigate('/signin') 
      } catch (error) {
        console.error(error)
        toast.error('Không thể đăng xuất')
      }
        
    }

    return (
        <Button onClick = {handleSignOut}> Logout</Button>
    )
}

export default Logout
