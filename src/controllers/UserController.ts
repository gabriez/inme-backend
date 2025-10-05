import type { RequestAPI, ResponseAPI } from "../typescript/express";

export const profile = (req: RequestAPI, res: ResponseAPI) => {
  res.status(200).json({
    status: true,
    data: req.user,
    message: "Éxito!",
  });
};

// export const GetProfile = (req: RequestAPI, res: ResponseAPI) => {};

// export const GetUsers = (req: RequestAPI, res: ResponseAPI) => {};

// export const EditProfile = (req: RequestAPI, res: ResponseAPI) => {};

// export const ChangePassword = (req: RequestAPI, res: ResponseAPI) => {};
