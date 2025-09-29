"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Eye, Settings, Users } from "lucide-react"

interface RoomType {
  id: string
  name: string
  description: string
  max_guests: number
  price_per_night: number
  amenities: string[]
  image_url: string
  is_active: boolean
}

interface RoomInstance {
  id: string
  room_number: string
  floor: number
  is_active: boolean
  room_type: RoomType
}

interface RoomStatus {
  room_instance_id: string
  room_number: string
  room_type: string
  status: "available" | "occupied" | "maintenance" | "cleaning"
  current_booking?: {
    guest_name: string
    check_out_date: string
  }
}

export default function RoomManagementPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([])
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [selectedRoomInstance, setSelectedRoomInstance] = useState<RoomInstance | null>(null)
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false)
  const [showRoomInstanceModal, setShowRoomInstanceModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchRoomData()
  }, [])

  const fetchRoomData = async () => {
    try {
      const [roomTypesRes, roomInstancesRes, roomStatusRes] = await Promise.all([
        fetch("/api/admin/rooms/types"),
        fetch("/api/admin/rooms/instances"),
        fetch("/api/admin/rooms/status"),
      ])

      if (roomTypesRes.ok) {
        const roomTypesData = await roomTypesRes.json()
        setRoomTypes(roomTypesData)
      }

      if (roomInstancesRes.ok) {
        const roomInstancesData = await roomInstancesRes.json()
        setRoomInstances(roomInstancesData)
      }

      if (roomStatusRes.ok) {
        const roomStatusData = await roomStatusRes.json()
        setRoomStatuses(roomStatusData)
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setIsEditing(true)
    setShowRoomTypeModal(true)
  }

  const handleAddRoomType = () => {
    setSelectedRoomType(null)
    setIsEditing(false)
    setShowRoomTypeModal(true)
  }

  const handleEditRoomInstance = (roomInstance: RoomInstance) => {
    setSelectedRoomInstance(roomInstance)
    setIsEditing(true)
    setShowRoomInstanceModal(true)
  }

  const handleAddRoomInstance = () => {
    setSelectedRoomInstance(null)
    setIsEditing(false)
    setShowRoomInstanceModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-blue-500"
      case "maintenance":
        return "bg-red-500"
      case "cleaning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoomTypeColor = (roomType: string) => {
    switch (roomType) {
      case "Standard Room":
        return "bg-blue-500"
      case "Deluxe Room":
        return "bg-green-500"
      case "Executive Suite":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage room types, instances, and availability</p>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Room Status
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Room Types
          </TabsTrigger>
          <TabsTrigger value="instances" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Room Instances
          </TabsTrigger>
        </TabsList>

        {/* Room Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Current Room Status</h2>
            <Button onClick={fetchRoomData}>Refresh Status</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roomStatuses.map((room) => (
              <Card key={room.room_instance_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                    <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                  </div>
                  <CardDescription>{room.room_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {room.current_booking && (
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Guest:</strong> {room.current_booking.guest_name}
                      </p>
                      <p>
                        <strong>Check-out:</strong> {new Date(room.current_booking.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {room.status === "available" && <p className="text-sm text-muted-foreground">Ready for booking</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Room Types Tab */}
        <TabsContent value="types" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Room Types</h2>
            <Button onClick={handleAddRoomType}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room Type
            </Button>
          </div>

          <div className="grid gap-6">
            {roomTypes.map((roomType) => (
              <Card key={roomType.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getRoomTypeColor(roomType.name)}>{roomType.name}</Badge>
                      <Badge variant={roomType.is_active ? "default" : "secondary"}>
                        {roomType.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRoomType(roomType)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <CardTitle>{roomType.name}</CardTitle>
                  <CardDescription>{roomType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Max Guests</p>
                      <p className="text-muted-foreground">{roomType.max_guests}</p>
                    </div>
                    <div>
                      <p className="font-medium">Price per Night</p>
                      <p className="text-muted-foreground">₵{roomType.price_per_night}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">Amenities</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roomType.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Room Instances Tab */}
        <TabsContent value="instances" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Room Instances</h2>
            <Button onClick={handleAddRoomInstance}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room Instance
            </Button>
          </div>

          <div className="grid gap-4">
            {roomInstances.map((instance) => (
              <Card key={instance.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">Room {instance.room_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {instance.room_type.name} • Floor {instance.floor}
                        </p>
                      </div>
                      <Badge className={getRoomTypeColor(instance.room_type.name)}>{instance.room_type.name}</Badge>
                      <Badge variant={instance.is_active ? "default" : "secondary"}>
                        {instance.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRoomInstance(instance)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Room Type Modal */}
      <Dialog open={showRoomTypeModal} onOpenChange={setShowRoomTypeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update room type information" : "Create a new room type"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Room Type Name</Label>
                <Input id="name" defaultValue={selectedRoomType?.name || ""} placeholder="e.g., Standard Room" />
              </div>
              <div>
                <Label htmlFor="price">Price per Night (₵)</Label>
                <Input
                  id="price"
                  type="number"
                  defaultValue={selectedRoomType?.price_per_night || ""}
                  placeholder="150.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input id="maxGuests" type="number" defaultValue={selectedRoomType?.max_guests || ""} placeholder="2" />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={selectedRoomType?.is_active ? "active" : "inactive"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={selectedRoomType?.description || ""}
                placeholder="Describe the room type..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                defaultValue={selectedRoomType?.amenities.join(", ") || ""}
                placeholder="Free WiFi, Air Conditioning, TV"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRoomTypeModal(false)}>
                Cancel
              </Button>
              <Button>{isEditing ? "Update" : "Create"} Room Type</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Instance Modal */}
      <Dialog open={showRoomInstanceModal} onOpenChange={setShowRoomInstanceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Room Instance" : "Add Room Instance"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update room instance information" : "Create a new room instance"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input id="roomNumber" defaultValue={selectedRoomInstance?.room_number || ""} placeholder="101" />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" type="number" defaultValue={selectedRoomInstance?.floor || ""} placeholder="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select defaultValue={selectedRoomInstance?.room_type.id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instanceStatus">Status</Label>
                <Select defaultValue={selectedRoomInstance?.is_active ? "active" : "inactive"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRoomInstanceModal(false)}>
                Cancel
              </Button>
              <Button>{isEditing ? "Update" : "Create"} Room Instance</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
