using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace AutoSallonSolution.Hubs
{
  public class VehicleHub : Hub
  {
    public async Task SendVehicleNotification(string title, string image)
    {
      await Clients.All.SendAsync("ReceiveVehicle", new { title, image });
    }

    public override async Task OnConnectedAsync()
    {
      await base.OnConnectedAsync();
    }
  }
}
