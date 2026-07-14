export const createShipment = async (orderCode: string) => {
  // TODO: Integrate with GHN (Giao Hàng Nhanh) API
  console.log(`[GHN Mock] Created shipment for order ${orderCode}`);
  return {
    success: true,
    trackingCode: `GHN-${Date.now()}`
  };
};
