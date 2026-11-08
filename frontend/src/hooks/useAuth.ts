import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
  type Body_login_login_access_token as AccessToken,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  // 只能读取非 HttpOnly 的登录标记 Cookie，真正的 access_token 是 HttpOnly、JS 不可见
  return document.cookie.split("; ").some((c) => c.startsWith("logged_in="))
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => (await UsersService.readUserMe()).data,
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ body: data }),
    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (data: AccessToken) => {
    // 成功后后端会自行下发 HttpOnly access_token 与 logged_in 标记 Cookie
    await LoginService.loginAccessToken({
      body: data,
    })
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const logout = async () => {
    try {
      // 请求后端下发 Set-Cookie 删除 HttpOnly access_token
      await LoginService.loginLogout()
    } finally {
      document.cookie =
        "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      queryClient.clear()
      navigate({ to: "/login" })
    }
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
  }
}

export { isLoggedIn }
export default useAuth
